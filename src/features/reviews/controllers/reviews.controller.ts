import {
  Controller,
  Get,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { CreateReviewDto } from '../dto/create-review.dto';
import { ReviewsService } from '../services/reviews.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../../common/guards/admin.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserID } from '../../../common/decorators/user-id.decorator';
import { VinylId } from '../../../common/decorators/vinyl-id.decorator';
import { VinylAndReviewIds } from '../../../common/decorators/vinyl-and-review-ids.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Put()
  @ApiOperation({ summary: 'Create or update a review' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Review created or updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBody({
    description: 'Data to add or update review',
    schema: {
      example: {
        vinylId: 42,
        rating: 7,
        comment: 'Bad album!',
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
    @UserID() userId: number,
  ) {
    return this.reviewsService.addReview(createReviewDto, userId);
  }

  @Get(':vinylId')
  @ApiOperation({ summary: 'Get reviews for a specific vinyl' })
  @ApiParam({
    name: 'vinylId',
    type: Number,
    description: 'ID of the vinyl to get reviews for',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'List of reviews for the specified vinyl',
  })
  @ApiResponse({ status: 404, description: 'Vinyl not found' })
  @UseGuards(JwtAuthGuard)
  async getReviewsByVinyl(@VinylId() vinylId: number) {
    return this.reviewsService.findAllByVinyl(vinylId);
  }

  @Delete(':vinylId/:reviewId')
  @ApiOperation({ summary: 'Delete a review for a specific vinyl' })
  @ApiParam({
    name: 'vinylId',
    type: Number,
    description: 'ID of the vinyl to delete the review for',
  })
  @ApiParam({
    name: 'reviewId',
    type: Number,
    description: 'ID of the review to delete',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Review deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @UseGuards(AdminGuard)
  async deleteReview(
    @VinylAndReviewIds()
    data: {
      reviewId: number;
      vinylId: number;
    },
  ) {
    return this.reviewsService.deleteReview(data);
  }
}
