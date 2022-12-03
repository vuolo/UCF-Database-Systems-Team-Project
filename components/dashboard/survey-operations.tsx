"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Survey } from "@prisma/client";

import { DropdownMenu } from "@/ui/dropdown";
import { Icons } from "@/components/icons";
import { Alert } from "@/ui/alert";
import { toast } from "@/ui/toast";

async function deleteSurvey(surveyId: string) {
  const response = await fetch(`/api/surveys/${surveyId}`, {
    method: "DELETE",
  });

  if (!response?.ok) {
    toast({
      title: "Something went wrong.",
      message: "Your survey was not deleted. Please try again.",
      type: "error",
    });
  }

  return true;
}

interface SurveyOperationsProps {
  survey: Pick<Survey, "id" | "title">;
}

export function SurveyOperations({ survey }: SurveyOperationsProps) {
  const router = useRouter();
  const [showDeleteAlert, setShowDeleteAlert] = React.useState<boolean>(false);
  const [isDeleteLoading, setIsDeleteLoading] = React.useState<boolean>(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger className='flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-slate-50'>
          <Icons.ellipsis className='h-4 w-4' />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content>
            <DropdownMenu.Item>
              <Link href={`/editor/${survey.id}`} className='flex w-full'>
                Edit
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <Link
                href={`/surveys/${survey.id}/results`}
                className='flex w-full'
              >
                Results
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              className='flex cursor-pointer items-center text-red-600 focus:bg-red-50'
              onSelect={() => setShowDeleteAlert(true)}
            >
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu>
      <Alert open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <Alert.Content>
          <Alert.Header>
            <Alert.Title>
              Are you sure you want to delete this survey?
            </Alert.Title>
            <Alert.Description>This action cannot be undone.</Alert.Description>
          </Alert.Header>
          <Alert.Footer>
            <Alert.Cancel>Cancel</Alert.Cancel>
            <Alert.Action
              onClick={async (event) => {
                event.preventDefault();
                setIsDeleteLoading(true);

                const deleted = await deleteSurvey(survey.id);

                if (deleted) {
                  setIsDeleteLoading(false);
                  setShowDeleteAlert(false);
                  router.refresh();
                }
              }}
              className='bg-red-600 focus:ring-red-600'
            >
              {isDeleteLoading ? (
                <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <Icons.trash className='mr-2 h-4 w-4' />
              )}
              <span>Delete</span>
            </Alert.Action>
          </Alert.Footer>
        </Alert.Content>
      </Alert>
    </>
  );
}
