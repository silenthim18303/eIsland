# CLAUDE.md

## Documentation Rules

### Admonition Syntax

Documentation files in `src/introduction` support admonition blocks for emphasizing content:

```md
:::tip
Helpful tips and best practices.
:::

:::info
General information and explanations.
:::

:::note
Noteworthy details and supplementary information.
:::

:::important
Key information that users must be aware of.
:::

:::warning
Important notices and cautions.
:::

:::danger
Critical security notes and breaking changes.
:::
```

### Spoiler Text

Use `!!` to wrap spoiler text that requires user interaction to reveal:

```md
This is !!spoiler content!!.
```

### Language

All documentation content must be written in **English**. No Chinese text is allowed in any documentation files.

### Test Statistics

When documenting test coverage, use accurate numbers from the latest test run:

- **125 test files**
- **2068 tests**

Update these numbers when new test results show different counts.
