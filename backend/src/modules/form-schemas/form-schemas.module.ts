import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormSchemasService } from './form-schemas.service';
import { FormSchemasController } from './form-schemas.controller';
import { FormSchema } from './entities/form-schema.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FormSchema])],
  controllers: [FormSchemasController],
  providers: [FormSchemasService],
  exports: [FormSchemasService],
})
export class FormSchemasModule {}
