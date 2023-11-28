import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, } from 'typeorm';
import { ApiProperty } from "@nestjs/swagger";

export class ColumnNumericTransformer {
  to(data: number): number {
    return data;
  }

  from(data: string): number {
    return parseFloat(data);
  }
}


@Entity({ name: 'products' })
export class Product {
  @ApiProperty({ type: String })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: String })
  @Column({ length: 250 })
  name: string;

  @ApiProperty({ type: Number })
  @Column({ precision: 10, scale: 2, type: "decimal", transformer: new ColumnNumericTransformer() })
  price: number;

  @ApiProperty({ type: Number })
  @Column({ type: "int" })
  quantity: number;

  @ApiProperty({ type: Date })
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'now()',
  })
  createdAt: Date;

  @ApiProperty({ type: Date })
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
