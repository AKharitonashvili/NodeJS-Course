import { MigrationInterface, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

export class CreateTables1730834804753 implements MigrationInterface {
  private loadSql(fileName: string): string {
    const filePath = path.join(__dirname, '..', 'migrations', 'sql', fileName);
    return fs.readFileSync(filePath, 'utf-8');
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(this.loadSql('create_user_table.sql'));
    await queryRunner.query(this.loadSql('insert_users.sql'));
    await queryRunner.query(this.loadSql('create_vinyl_table.sql'));
    await queryRunner.query(this.loadSql('insert_vinyls.sql'));
    await queryRunner.query(this.loadSql('create_review_table.sql'));
    await queryRunner.query(this.loadSql('create_purchased_vinyl_table.sql'));
    await queryRunner.query(this.loadSql('create_log_table.sql'));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS log`);
    await queryRunner.query(`DROP TABLE IF EXISTS purchased_vinyl`);
    await queryRunner.query(`DROP TABLE IF EXISTS review`);
    await queryRunner.query(`DROP TABLE IF EXISTS vinyl`);
    await queryRunner.query(`DROP TABLE IF EXISTS user`);
  }
}
