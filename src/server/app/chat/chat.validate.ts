import { z } from "zod";

import ValidationMessages from "../utils/config/validationMessages";

const ChatValidate = z.object({
  text: z.string().min(1, {
    message: ValidationMessages.requiredMessage(),
  }),
});

export default ChatValidate;