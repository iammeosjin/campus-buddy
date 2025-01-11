// routes/resources.tsx
import { Handlers } from '$fresh/server.ts';
import { Head } from '$fresh/runtime.ts';
import Header from '../../islands/Header.tsx';
import ResourceList from '../../islands/ResourceList.tsx';
import ResourceModel from '../../models/resource.ts';
import { Resource } from '../../types.ts';

export const handler: Handlers = {
  async GET(_, ctx) {
    const resources = await ResourceModel.list();
    return ctx.render({
      resources,
    });
  },
};

export default function Resources(
  { data }: { data: { resources: Resource[] } },
) {
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
        <ResourceList resources={data.resources} />
      </div>
    </>
  );
}
