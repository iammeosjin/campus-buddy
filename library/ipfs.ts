export async function uploadToPinata(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  // Optional metadata
  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      description: 'Uploaded via Deno',
    },
  });
  formData.append('pinataMetadata', metadata);

  // Optional pinning options
  const pinataOptions = JSON.stringify({
    cidVersion: 1,
  });
  formData.append('pinataOptions', pinataOptions);

  const response = await fetch(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    {
      method: 'POST',
      headers: {
        Authorization:
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4ZGZiMDdiYi1lNzVhLTRhM2QtYjhlMi02NDJlNjdjNTA5OTAiLCJlbWFpbCI6ImlhbW1lb3NqaW5AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImE2MmM1NjQ0ODFiYWJkYjJhM2ZkIiwic2NvcGVkS2V5U2VjcmV0IjoiZTQzMzkwZmQxZTYzYjEwMWU5ZjE3MjNhNGFiYTc4ZjBlZDM2MmRjMDkyM2Q4YTFmZGE1YzYwNDVmNTUyZWJmYSIsImV4cCI6MTc2ODYzNTkzN30.39tGdoRJTPxIXlJGD1A0-Ir3gRowshaYGtWtIZhOgzk`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    console.error('Upload failed:', await response.text());
    return null;
  }

  const data = await response.json();
  console.log('File uploaded successfully:', data);
  return data.IpfsHash;
}
