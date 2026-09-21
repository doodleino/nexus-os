/**
 * Universal Agent OS - Filesystem Boundary & Containment Security
 *
 * Enforces strict sandbox boundaries preventing path traversal, symlink escapes,
 * and arbitrary write vulnerabilities during install-state replays.
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Check if a path target or any filesystem node exists
 * @param {string} target
 * @returns {boolean}
 */
function pathEntryExists(target) {
  try {
    fs.lstatSync(target);
    return true;
  } catch (err) {
    if (err && (err.code === 'ENOENT' || err.code === 'ENOTDIR')) {
      return false;
    }
    throw err;
  }
}

/**
 * Resolve canonical realpath for a target, even if the leaf or some descendants do not yet exist.
 * Traverses up until an existing directory is found, resolves its realpath, then joins the pending tail.
 * @param {string} target
 * @returns {string}
 */
function realpathNearestExisting(target) {
  let probe = path.resolve(target);
  const pendingSegments = [];

  while (!pathEntryExists(probe)) {
    const parentFolder = path.dirname(probe);
    if (parentFolder === probe) {
      break;
    }
    pendingSegments.unshift(path.basename(probe));
    probe = parentFolder;
  }

  const resolvedBase = fs.realpathSync(probe);
  return pendingSegments.length > 0 ? path.join(resolvedBase, ...pendingSegments) : resolvedBase;
}

/**
 * Verify whether target resides within trusted root boundaries with symlinks evaluated
 * @param {string} target
 * @param {string} root
 * @returns {{contained: boolean, realRoot: string, realTarget: string}}
 */
function resolveContainment(target, root) {
  const realRoot = realpathNearestExisting(root);
  const realTarget = realpathNearestExisting(target);
  const relPath = path.relative(realRoot, realTarget);

  const isContained = relPath === ''
    || (
      relPath !== '..'
      && !relPath.startsWith(`..${path.sep}`)
      && !path.isAbsolute(relPath)
    );

  return {
    contained: isContained,
    realRoot,
    realTarget
  };
}

/**
 * Test whether target path is contained within root
 * @param {string} target
 * @param {string} root
 * @returns {boolean}
 */
function isWithinRoot(target, root) {
  if (!root) return false;

  try {
    return resolveContainment(target, root).contained;
  } catch {
    return false;
  }
}

/**
 * Fail-closed assertion ensuring target is contained within root before file mutation
 * @param {string} target
 * @param {string} root
 * @param {string} [action='write']
 * @returns {string} Canonicalized realTarget
 * @throws {Error} If destination is outside trusted boundary
 */
function assertWithinTrustedRoot(target, root, action = 'write') {
  if (!target || typeof target !== 'string') {
    throw new Error(`Refusing to ${action}: missing destination path.`);
  }
  if (!root) {
    throw new Error(`Refusing to ${action} '${target}': no trusted install root resolved.`);
  }

  let containmentResult;
  try {
    containmentResult = resolveContainment(target, root);
  } catch {
    containmentResult = null;
  }

  if (!containmentResult || !containmentResult.contained) {
    throw new Error(
      `Refusing to ${action} outside the install root: '${target}' is not within '${root}'.`
    );
  }

  return containmentResult.realTarget;
}

module.exports = {
  assertWithinTrustedRoot,
  isWithinRoot,
  realpathNearestExisting,
  resolveContainment
};
