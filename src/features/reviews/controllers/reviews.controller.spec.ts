import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from '../services/reviews.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../../common/guards/admin.guard';
import { CreateReviewDto } from '../dto/create-review.dto';
import {
  BadRequestException,
  ValidationPipe,
  NotFoundException,
} from '@nestjs/common';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let reviewsService: ReviewsService;

  const mockReviewsService = {
    addReview: jest.fn(),
    findAllByVinyl: jest.fn(),
    deleteReview: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: mockReviewsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ReviewsController>(ReviewsController);
    reviewsService = module.get<ReviewsService>(ReviewsService);
  });

  it('should call addReview with correct params', async () => {
    const userId = 1;
    const createReviewDto: CreateReviewDto = {
      vinylId: 42,
      rating: 7,
      comment: 'Bad album!',
    };
    mockReviewsService.addReview.mockResolvedValue({ message: 'Review added' });

    const result = await controller.createReview(createReviewDto, userId);

    expect(mockReviewsService.addReview).toHaveBeenCalledWith(
      createReviewDto,
      userId,
    );
    expect(result).toEqual({ message: 'Review added' });
  });

  it('should retrieve reviews for a specific vinyl', async () => {
    const vinylId = 42;
    const mockReviews = [{ id: 1, rating: 4, comment: 'Good album' }];
    mockReviewsService.findAllByVinyl.mockResolvedValue(mockReviews);

    const result = await controller.getReviewsByVinyl(vinylId);

    expect(mockReviewsService.findAllByVinyl).toHaveBeenCalledWith(vinylId);
    expect(result).toEqual(mockReviews);
  });

  it('should throw NotFoundException if vinylId not found when retrieving reviews', async () => {
    const vinylId = 42;
    mockReviewsService.findAllByVinyl.mockRejectedValue(
      new NotFoundException(),
    );

    await expect(controller.getReviewsByVinyl(vinylId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should delete a review by vinylId and reviewId', async () => {
    const data = { vinylId: 42, reviewId: 1 };
    mockReviewsService.deleteReview.mockResolvedValue({
      message: 'Review deleted successfully',
    });

    const result = await controller.deleteReview(data);

    expect(mockReviewsService.deleteReview).toHaveBeenCalledWith(data);
    expect(result).toEqual({ message: 'Review deleted successfully' });
  });

  it('should throw NotFoundException if review not found when deleting', async () => {
    const data = { vinylId: 42, reviewId: 1 };
    mockReviewsService.deleteReview.mockRejectedValue(new NotFoundException());

    await expect(controller.deleteReview(data)).rejects.toThrow(
      NotFoundException,
    );
  });
});
