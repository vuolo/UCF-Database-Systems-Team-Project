import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth/next";
import sgMail from "@sendgrid/mail";

import { withMethods } from "@/lib/api-middlewares/with-methods";
import { authOptions } from "@/lib/auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) return res.status(403).end();

  const { user } = session;

  if (req.method === "POST") {
    try {
      const body = req.body;

      sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

      for (const participant of body.participants) {
        const email = {
          to: participant.trim(),
          from: "ucf.studentsurveys@gmail.com",
          templateId: "d-9c47f7fcdd8d4f7bb246a7ea7be72b27",
          dynamicTemplateData: {
            NAME: user.name,
            SURVEY_TITLE: body.surveyTitle,
            SURVEY_DESCRIPTION: body.surveyDescription,
            SURVEY_START_DATE: body.surveyStartAt,
            SURVEY_END_DATE: body.surveyEndAt,
            SURVEY_LINK: body.surveyLink,
          },
        };

        try {
          await sgMail.send(email);
        } catch (error) {
          return res.status(500).end();
        }
      }

      return res.end();
    } catch (error) {
      return res.status(500).end();
    }
  }
}

export default withMethods(["POST"], handler);
