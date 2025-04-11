import { Injectable } from "@nestjs/common";
import { CommonRepository } from "./common.repository";

@Injectable()
export class CommonService {
  constructor(private readonly commonRepository: CommonRepository) {}
}
