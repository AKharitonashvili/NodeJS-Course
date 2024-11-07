import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { NotFoundException } from '@nestjs/common';
import { UserRepositoryService } from '../../../common/repositories/user-repository/user-repository.service';
import { VinylRepositoryService } from '../../../common/repositories/vinyl-repository/vinyl-repository.service';
import { ReviewRepositoryService } from '../../../common/repositories/review-repository/review-repository.service';
import { Review } from '../entities/review.entity';
import { Vinyl } from '../../vinyl/entities/vinyl.entity';
import { User } from '../../users/entities/user.entity';
import { CreateReviewDto } from '../dto/create-review.dto';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let vinylRepository: VinylRepositoryService;
  let userRepository: UserRepositoryService;
  let reviewRepository: ReviewRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: VinylRepositoryService,
          useValue: {
            findVinylById: jest.fn(),
            updateVinyl: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: UserRepositoryService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: ReviewRepositoryService,
          useValue: {
            createReview: jest.fn(),
            saveOrUpdateReview: jest.fn(),
            findAndCountById: jest.fn(),
            findAllByVinylId: jest.fn(),
            deleteReview: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    vinylRepository = module.get<VinylRepositoryService>(
      VinylRepositoryService,
    );
    userRepository = module.get<UserRepositoryService>(UserRepositoryService);
    reviewRepository = module.get<ReviewRepositoryService>(
      ReviewRepositoryService,
    );
  });

  it('should add a review successfully', async () => {
    const userId = 1;
    const createReviewDto: CreateReviewDto = {
      vinylId: 1,
      rating: 5,
      comment: 'Great vinyl!',
    };
    const user: User = { id: userId, email: 'test@test.com' } as User;
    const vinyl: Vinyl = { id: 1, name: 'Sample Vinyl', reviews: [] } as Vinyl;
    const newReview = { id: 1, ...createReviewDto, user, vinyl } as Review;

    jest.spyOn(vinylRepository, 'findVinylById').mockResolvedValue(vinyl);
    jest.spyOn(userRepository, 'findById').mockResolvedValue(user);
    jest.spyOn(reviewRepository, 'createReview').mockReturnValue(newReview);
    jest
      .spyOn(reviewRepository, 'saveOrUpdateReview')
      .mockResolvedValue(newReview);
    jest.spyOn(service, 'updateAverageRating').mockResolvedValue();

    const result = await service.addReview(createReviewDto, userId);

    expect(result).toEqual(newReview);
    expect(reviewRepository.createReview).toHaveBeenCalledWith(
      vinyl,
      user,
      createReviewDto.rating,
      createReviewDto.comment,
    );
    expect(reviewRepository.saveOrUpdateReview).toHaveBeenCalledWith(newReview);
    expect(service.updateAverageRating).toHaveBeenCalledWith(
      createReviewDto.vinylId,
    );
  });

  it('should update average rating', async () => {
    const vinylId = 1;
    const reviews = [{ rating: 4 }, { rating: 5 }] as Review[];
    jest
      .spyOn(reviewRepository, 'findAndCountById')
      .mockResolvedValue([reviews, reviews.length]);
    jest.spyOn(vinylRepository, 'updateVinyl').mockResolvedValue(undefined);

    await service.updateAverageRating(vinylId);

    expect(reviewRepository.findAndCountById).toHaveBeenCalledWith(vinylId);
    expect(vinylRepository.updateVinyl).toHaveBeenCalledWith(vinylId, 4.5);
  });

  it('should throw NotFoundException if vinyl is not found when adding a review', async () => {
    const createReviewDto: CreateReviewDto = {
      vinylId: 1,
      rating: 5,
      comment: 'Great vinyl!',
    };
    jest.spyOn(vinylRepository, 'findVinylById').mockResolvedValue(null);

    await expect(service.addReview(createReviewDto, 1)).rejects.toThrow(
      NotFoundException,
    );
    expect(vinylRepository.findVinylById).toHaveBeenCalledWith(
      createReviewDto.vinylId,
    );
  });

  it('should delete a review successfully', async () => {
    const vinylId = 1;
    const reviewId = 1;
    const vinyl: Vinyl = {
      id: vinylId,
      reviews: [{ id: reviewId }] as Review[],
    } as Vinyl;
    const deleteResult = { affected: 1 };

    jest.spyOn(vinylRepository, 'findOne').mockResolvedValue(vinyl);
    jest
      .spyOn(reviewRepository, 'deleteReview')
      .mockResolvedValue(deleteResult as any);
    jest.spyOn(service, 'updateAverageRating').mockResolvedValue();

    const result = await service.deleteReview({ reviewId, vinylId });

    expect(result).toEqual({ message: 'Review deleted successfully' });
    expect(reviewRepository.deleteReview).toHaveBeenCalledWith(reviewId);
    expect(service.updateAverageRating).toHaveBeenCalledWith(vinylId);
  });

  it('should throw NotFoundException if review does not exist when deleting', async () => {
    const vinylId = 1;
    const reviewId = 2;
    const vinyl: Vinyl = {
      id: vinylId,
      reviews: [{ id: 1 }] as Review[],
    } as Vinyl;

    jest.spyOn(vinylRepository, 'findOne').mockResolvedValue(vinyl);

    await expect(service.deleteReview({ reviewId, vinylId })).rejects.toThrow(
      NotFoundException,
    );
  });
});
