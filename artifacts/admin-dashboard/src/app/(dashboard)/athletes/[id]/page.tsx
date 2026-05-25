import AthleteDetailPage from "./AthleteDetailClient";

export async function generateStaticParams() {
  return [{ id: "u1" }];
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <AthleteDetailPage params={Promise.resolve(params)} />;
}
