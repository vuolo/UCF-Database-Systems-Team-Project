interface SurveyPageProps {
  params: {
    slug: string[];
  };
}

export default async function SurveyPage({ params }: SurveyPageProps) {
  const slug = params?.slug?.join("/");

  return (
    <div className='flex flex-col items-center justify-center pt-20 space-y-5'>
      <h1 className='text-4xl'>coming soon</h1>
      <p>the survey '{slug}' hasn't been created yet...</p>
    </div>
  );
}
