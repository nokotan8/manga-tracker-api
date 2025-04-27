import { Connection } from "mysql2/promise";

declare global {
  namespace Express {
    interface Locals {
      conn: Connection;
    }
  }
}
