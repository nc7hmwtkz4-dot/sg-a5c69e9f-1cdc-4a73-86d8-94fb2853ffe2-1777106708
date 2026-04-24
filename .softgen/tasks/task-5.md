---
title: Upload & Validation Flow
status: todo
priority: high
type: feature
tags: [upload, ai, forms]
created_by: agent
created_at: 2026-04-24T07:15:48Z
position: 5
---

## Notes
Screenshot upload with manual validation form. Initially manual input (AI/OCR deferred to later phase). User confirms all extracted data before submission.

## Checklist
- [ ] Create /upload page with drag-drop zone
- [ ] Build image preview component
- [ ] Create validation form with brand/model dropdowns
- [ ] Add reputation and price input fields
- [ ] Build 8-part rarity grid (clickable icons to select rarity)
- [ ] Implement form submission to observations table
- [ ] Trigger learning algorithm on successful validation
- [ ] Show success message with "Contribuer à nouveau" CTA

## Acceptance
- User can upload screenshot and see preview
- All form fields are editable before submission
- Validated data saves to observations table
- Part weights update automatically after submission