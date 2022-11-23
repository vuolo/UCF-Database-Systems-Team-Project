export default function Head() {
  return (
    <>
      <title>UCF Student Surveys</title>
      <meta content='width=device-width, initial-scale=1' name='viewport' />
      <meta charSet='utf-8' />
      <meta name='description' content='Surveys for UCF students.' />

      {/* RealFaviconGenerator.net Favicon Package */}
      <link
        rel='apple-touch-icon'
        sizes='180x180'
        href='/apple-touch-icon.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='32x32'
        href='/favicon-32x32.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='16x16'
        href='/favicon-16x16.png'
      />
      <link rel='manifest' href='/site.webmanifest' />
      <link rel='mask-icon' href='/safari-pinned-tab.svg' color='#ffc907' />
      <meta name='msapplication-TileColor' content='#000000' />
      <meta name='theme-color' content='#ffffff' />
    </>
  );
}
