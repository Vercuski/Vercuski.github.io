const e=`---
type: pattern
category: concurrency
domain:
  - '[[Design Patterns]]'
  - '[[System Design]]'
status: draft
summary: "Runs the same small, non-branching calculation many times in parallel over shared arrays, each instance differing only by an integer index, as on GPUs."
aliases:
  - Compute Kernel Pattern
  - GPU Kernel
source: https://en.wikipedia.org/wiki/Compute_kernel
created: 2026-10-28
updated: 2026-10-28
review:
tags:
  - trade_off
---
> [!summary] TL;DR
> Write the inner calculation once as a kernel and launch it across thousands of indices at once. Each instance reads and writes its own slice of shared arrays using index arithmetic, with little or no branching. Matrix multiplication and neural-network layers on GPUs are the typical uses; SIMD (\`Vector<T>\`) applies the same idea on a CPU.

## Problem
- Large data-parallel workloads (matrix math, image processing, ML) are too slow when processed element by element on one core.

## Solution
- Express the per-element work as a function of an index (a kernel).
- Lay data out in contiguous arrays the kernel can address with index math.
- Avoid branches so all parallel lanes run the same instructions.
- Launch the kernel over the full index range on a GPU (CUDA, OpenCL, compute shaders) or with SIMD/parallel loops.

## Structure
\`\`\`mermaid
flowchart LR
    D[("Input arrays<br/>shared memory")] --> K0["kernel(i = 0)"]
    D --> K1["kernel(i = 1)"]
    D --> K2["kernel(i = ...)"]
    D --> KN["kernel(i = n)"]
    K0 & K1 & K2 & KN --> O[("Output array")]
\`\`\`

## When to use / when not to
| Use when | Avoid when |
| --- | --- |
| Massive, uniform data-parallel numeric work | Branchy, irregular logic |
| GPU or SIMD hardware is available | Small data sets where transfer and launch overhead dominate |

## Trade-offs
| Pro | Con |
| --- | --- |
| Huge throughput on parallel hardware | Specialized tooling and debugging |
| Simple per-element code | Data transfer costs between host and device |
|  | Branch divergence kills performance |

## Related patterns
- **Alternatives:** [[Thread Pool]] with parallel loops (\`Parallel.For\`); vectorized CPU code
- **Often combined with:** [[Safe Concurrency with Exclusive Ownership]] (each index owns its output slot)
- **Anti-pattern to watch for:** [[Premature Optimization]]
- Catalog: [[Software Design Patterns & Anti Patterns#Concurrency|Concurrency patterns]].
`;export{e as default};
