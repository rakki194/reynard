# Diffusion LLM Demo Walkthrough

This short script demonstrates generating text with Diffusion LLM and
inserting it into a caption/text file, with accessibility tips.

## Prerequisites

- Ensure `DIFFUSION_LLM_ENABLED=true` and a model is loaded (DreamOn or LLaDA)
- Frontend running; open Reynard

## Steps

1. Open the sidebar and select the Text LLM functionality
2. In the Generator panel:
   - Choose a model (e.g., LLaDA)
   - Enter your prompt
   - Press Ctrl/Cmd+Enter or click Generate
   - The output will stream; on completion it’s auto-copied to the clipboard
3. Insert the result:
   - In Image Caption Editor: use “Send to Diffusion LLM” to generate, then insert into caption
   - In Text modality: use “New from LLM” to create a Draft, then Save as .txt to persist
4. Infilling (non-destructive preview):
   - In Text modality, select a single file
   - Click “Infill selection (preview)” to stream a Draft based on the file content

## Accessibility Checklist

- All controls have descriptive labels
- Keyboard shortcuts: Ctrl/Cmd+Enter triggers generation
- Focus moves to output after streaming completes
- Notifications include clear status, success, and error messages

## Troubleshooting

- If generation is slow or fails, try switching device to CPU in Settings
- If text spacing looks odd, enable Fix punctuation in Settings
- If draft doesn’t save, confirm you’re browsing a writable path and check `/api/text/create` response
