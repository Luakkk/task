import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'title must not be empty' })
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
