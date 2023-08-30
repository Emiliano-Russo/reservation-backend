import { Controller } from "@nestjs/common";
import { BusinessTypeService } from "./businessType.service";


@Controller('businessType')
export class BusinessTypeController {

    constructor(
        private readonly businessTypeService: BusinessTypeService,
    ) {
    }
}