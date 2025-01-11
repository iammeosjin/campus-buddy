// deno-lint-ignore-file no-explicit-any

import { Operator } from '../types.ts';

async function handleFileUpload(
  e: Event,
  uploadType: string,
  operator?: Operator,
) {
  e.preventDefault();
  const file = (e.target as any).files.item(0) as File;
  const data = await file.text();
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Upload-Type': uploadType,
    },
    body: JSON.stringify({
      data,
      operator,
    }),
  });
  if (response.status === 400) {
    alert(await response.text());
    return;
  }

  alert('Done');
}

export default function FileUpload(
  params: { uploadType: string; operator?: Operator },
) {
  return (
    <div class='mr-1 button-primary'>
      <label for='fileUpload'>
        Bulk Upload
        {/* <UploadIcon class='w-5 h-5 text-gray-800 hover:text-blue-400 hover:w-6 hover:h-6' /> */}
      </label>

      <input
        id='fileUpload'
        type='file'
        name='file'
        class='hidden'
        accept='.csv'
        multiple={false}
        onChange={(e) =>
          handleFileUpload(e, params.uploadType, params.operator)}
      />
    </div>
  );
}
