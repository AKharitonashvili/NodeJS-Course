import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { CreateVinylDto } from '../dtos/create-vinyl.dto';
import { VinylQueryDto } from '../dtos/vinyl-query.dto';
import { VinylService } from '../services/vinyl.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UpdateVinylDto } from '../dtos/update-vinyl.dto';
import { Vinyl } from '../entities/vinyl.entity';
import { VinylQueryParserPipe } from '../pipes/vinyl-query-parser.pipe';
import { AdminGuard } from '../../../common/guards/admin.guard';
import { OptionalJwtAuthGuard } from '../../../common/guards/optional-jwt-auth.guard';
import { Id } from '../../../common/decorators/id.decorator';
import { ApiQueries } from '../../../common/decorators/api-queries.decorator';
import { createVinyMock, getAllVinylsApiQueries } from '../mocks/vinyl.mocks';
import { UserID } from '../../../common/decorators/user-id.decorator';

@ApiTags('Vinyls')
@Controller('vinyls')
export class VinylController {
  constructor(private readonly vinylService: VinylService) {}

  @Get()
  @ApiOperation({ summary: 'Get all vinyl records' })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiQueries(getAllVinylsApiQueries)
  async getAllVinyls(
    @UserID() userID: number | null,
    @Query(VinylQueryParserPipe) query: VinylQueryDto,
  ): Promise<Vinyl[]> {
    if (userID) {
      return this.vinylService.findAllWithSearch(query, userID);
    } else {
      return this.vinylService.findAll(query);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new vinyl record' })
  @ApiResponse({
    status: 201,
    description: 'Vinyl created successfully',
    type: Vinyl,
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBody({
    description: 'Data to create a new vinyl record',
    schema: {
      example: createVinyMock,
    },
  })
  async createVinyl(@Body() createVinylDto: CreateVinylDto): Promise<Vinyl> {
    return this.vinylService.create(createVinylDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing vinyl record' })
  @ApiParam({
    name: 'id',
    description: 'ID of the vinyl record to update',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Vinyl updated successfully',
    type: Vinyl,
  })
  @ApiResponse({ status: 404, description: 'Vinyl not found' })
  @ApiBody({
    description: 'Data to update a vinyl record',
    schema: {
      example: createVinyMock,
    },
  })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  async updateVinyl(
    @Id() id: number,
    @Body() updateVinylDto: UpdateVinylDto,
  ): Promise<Vinyl> {
    return this.vinylService.update(id, updateVinylDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vinyl record' })
  @ApiParam({
    name: 'id',
    description: 'ID of the vinyl record to delete',
    type: Number,
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Vinyl deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vinyl not found' })
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  async deleteVinyl(@Id() id: number): Promise<{ message: string }> {
    await this.vinylService.delete(id);
    return { message: 'Vinyl deleted successfully' };
  }
}
