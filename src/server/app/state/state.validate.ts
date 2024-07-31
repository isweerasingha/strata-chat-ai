import { z } from "zod";
import ValidationMessages from "../utils/config/validationMessages";

const StateValidate = z.object({
  name: z.string().min(1, {
    message: ValidationMessages.requiredWithKey("State", "name"),
  }),
});

export default StateValidate;
