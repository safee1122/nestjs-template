import { IsInt, IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min, MinLength } from "class-validator";
import { ApiOperation, ApiProperty } from "@nestjs/swagger";


export class CreateProductDto {
  @ApiProperty({
    description: "name",
    example: "product 1",
    maximum: 255,
    minimum: 1,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: "name must be longer than or equal to 1 characters" })
  @MaxLength(255, { message: "name must be shorter than or equal to 255 characters" })
  name: string;

  @ApiProperty({
    description: "quantity",
    example: 1,
    maximum: 2_147_483_647,
    minimum: 0,
    required: true,
  })
  @IsInt()
  @Min(0, { message: "quantity must be greater than or equal to 0" })
  @Max(2_147_483_647, { message: "quantity must be less than or equal to 2,147,483,647" })
  quantity: number;

  @ApiProperty({
    description: "price",
    example: 1.99,
    maximum: 99_999_999.99,
    minimum: 0,
    required: true,
  })
  @IsNumber({
    maxDecimalPlaces: 2,
    allowNaN: false,
    allowInfinity: false
  }, { message: "price must be at most 2 decimal places" })
  @Max(99_999_999.99, { message: "price must be less than or equal to 99,999,999.99" })
  price: number;
}