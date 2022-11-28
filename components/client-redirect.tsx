"use client";

type Props = {
  URL?: string;
};

export function ClientRedirect({ URL = "/" }: Props) {
  if (typeof window !== "undefined") window.location.replace(URL);

  return <></>;
}
