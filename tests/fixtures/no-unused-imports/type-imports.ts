import type { Config } from "./types";
import { type Role, type User } from "./models";
import { helper, type HelperOptions } from "./utils";
import type * as Types from "./all-types";

const config: Config = { enabled: true };
const user: User = { name: "test" };
helper();
