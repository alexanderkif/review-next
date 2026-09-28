# Request Validation

Use the centralized schemas in `app/types/schemas.ts` for untrusted input. Validate data before database writes, external API calls, or other side effects, and use only the parsed result afterward.

## API Routes

For JSON bodies, use the shared `validate()` helper and return a `400` response when validation fails:

```ts
const result = validate(ProjectCreateSchema, await request.json());
if (!result.success) {
  return NextResponse.json({ error: 'Invalid project data' }, { status: 400 });
}

const project = result.data;
```

For query strings and dynamic route parameters, pass the raw values to a schema and use coercion only when the contract expects a number. Do not rely on TypeScript assertions to validate external input.

For `FormData`, use `validateFormData()` where its string/number/boolean conversion matches the form. Handle file values separately with the existing upload utilities and schemas.

## Schemas and Types

- Add or extend input schemas in `app/types/schemas.ts` and reuse them across routes and server actions.
- Derive input types from schemas with `z.infer<typeof Schema>`; keep API response types as TypeScript interfaces unless runtime response validation is specifically required.
- Use `safeParse()` through `validate()` for untrusted input so validation failures are handled as normal responses.
- Keep validation messages safe for clients; do not return secrets, raw payloads, or internal exception details.
- Preserve the existing image format and size policies in `app/lib/image-utils.ts` when changing image upload validation.

## Verification

There is currently no automated test runner or test suite. Run `npx tsc --noEmit` and `npm run lint` for changes; add focused schema or route tests when test infrastructure is introduced.