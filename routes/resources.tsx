// routes/resources.tsx
import { Head } from '$fresh/runtime.ts';
import Header from '../islands/Header.tsx';
import ResourceList from '../islands/ResourceList.tsx';

export default function Resources() {
  return (
    <>
      <Head>
        <title>CampusBuddy Resource Management</title>
        <link
          href='/css/theme.css'
          rel='stylesheet'
        />
        <link
          href='/css/header.css'
          rel='stylesheet'
        />
      </Head>
      <Header activePage='/resources' />
      <div class='p-4'>
        <h1 class='text-3xl font-bold mb-6'>Manage Resources</h1>
        <ResourceList />
      </div>
    </>
  );
}
