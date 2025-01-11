// deno-lint-ignore-file no-explicit-any
// routes/resources.tsx
import { Handlers } from '$fresh/server.ts';
import { Head } from '$fresh/runtime.ts';
import Header from '../islands/Header.tsx';
import Bluebird from 'npm:bluebird';
import ResourceList from '../islands/ResourceList.tsx';
import ResourceModel from '../models/resource.ts';
import { Operator, OperatorRole, Resource } from '../types.ts';
import OperatorModel from '../models/operator.ts';
import { authorize } from '../middlewares/authorize.ts';

export const handler: Handlers = {
  async GET(req, ctx) {
    const username = authorize(req);
    if (!username) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/login' }, // Redirect to home if already logged in
      });
    }
    const resources = await ResourceModel.list();
    const operator = await OperatorModel.get([username]);
    if (!operator) {
      return new Response(null, {
        status: 302,
        headers: { Location: '/logout' }, // Redirect to home if already logged in
      });
    }
    const cache = new Map<string, Operator | null>();
    cache.set(operator.id.join(';'), operator);

    return ctx.render({
      resources: await Bluebird.map(resources, async (resource: Resource) => {
        let creator = cache.get(resource.creator.join(';'));
        if (!creator) {
          creator = await OperatorModel.get(resource.creator);
          cache.set(resource.creator.join(';'), creator);
        }

        if (!creator) return null;

        if (
          operator.role === OperatorRole.OPERATOR &&
          operator.id.join(';') !== creator.id.join(';')
        ) return null;

        return {
          ...resource,
          creator,
        };
      }).then((resources: any) =>
        resources.filter((resource: any) => !!resource)
      ),
      operator,
    });
  },
};

export default function Resources(
  { data }: {
    data: {
      resources: (Omit<Resource, 'creator'> & { creator: Operator })[];
      operator: Operator;
    };
  },
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
      <Header activePage='/resources' operator={data.operator} />
      <div class='p-4'>
        <h1 class='text-3xl font-bold mb-6'>Manage Resources</h1>
        <ResourceList resources={data.resources} operator={data.operator} />
      </div>
    </>
  );
}
