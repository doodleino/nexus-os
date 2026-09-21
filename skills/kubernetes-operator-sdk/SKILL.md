---
name: kubernetes-operator-sdk
description: Custom Kubernetes controllers and CRD reconciliation loops using Go Operator SDK and Kubebuilder.
metadata:
  origin: NEXUS-OS
---

# Kubernetes Operator SDK & Controllers

Use this skill when automating lifecycle management of custom stateful workloads via Kubernetes Custom Resource Definitions (CRDs).

## Reconciliation Invariants

1. **Idempotence**: Every `Reconcile()` call must produce the same desired cluster state regardless of how many times it triggers.
2. **Status Subresource**: Never update object Spec inside the controller loop; write status updates exclusively to `r.Status().Update()`.
