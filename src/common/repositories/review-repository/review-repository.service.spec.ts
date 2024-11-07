import { Test, TestingModule } from '@nestjs/testing';
import { ReviewRepositoryService } from './review-repository.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Review } from '../../../features/reviews/entities/review.entity';
import { DeleteResult, Repository } from 'typeorm';
import { User } from '../../../features/users/entities/user.entity';
import { Vinyl } from '../../../features/vinyl/entities/vinyl.entity';

describe('ReviewRepositoryService', () => {
  let service: ReviewRepositoryService;
  let reviewRepository: Repository<Review>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewRepositoryService,
        {
          provide: getRepositoryToken(Review),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReviewRepositoryService>(ReviewRepositoryService);
    reviewRepository = module.get<Repository<Review>>(
      getRepositoryToken(Review),
    );
  });

  it('should create a new review', () => {
    const vinyl = { id: 1 } as Vinyl;
    const user = { id: 1 } as User;
    const rating = 5;
    const comment = 'Great vinyl!';
    const createdReview = { vinyl, user, rating, comment } as Review;

    jest.spyOn(reviewRepository, 'create').mockReturnValue(createdReview);

    const review = service.createReview(vinyl, user, rating, comment);

    expect(review).toEqual(createdReview);
    expect(reviewRepository.create).toHaveBeenCalledWith({
      vinyl,
      user,
      rating,
      comment,
    });
  });

  it('should save or update an existing review', async () => {
    const user = { id: 1 } as User;
    const vinyl = { id: 1 } as Vinyl;
    const reviewData = { rating: 5, comment: 'Amazing!' };

    const existingReview = { id: 1, ...reviewData, user, vinyl } as Review;

    jest.spyOn(reviewRepository, 'findOne').mockResolvedValue(existingReview);
    jest.spyOn(reviewRepository, 'save').mockResolvedValue(existingReview);

    const result = await service.saveOrUpdateReview({
      user,
      vinyl,
      ...reviewData,
    });
    expect(result).toEqual(existingReview);
    expect(reviewRepository.save).toHaveBeenCalledWith(existingReview);
  });

  it('should create and save a new review if it does not exist', async () => {
    const user = { id: 2 } as User;
    const vinyl = { id: 2 } as Vinyl;
    const reviewData = { rating: 4, comment: 'Nice!' };
    const newReview = { id: 3, ...reviewData, user, vinyl } as Review;

    jest.spyOn(reviewRepository, 'findOne').mockResolvedValue(null);
    jest.spyOn(reviewRepository, 'create').mockReturnValue(newReview);
    jest.spyOn(reviewRepository, 'save').mockResolvedValue(newReview);

    const result = await service.saveOrUpdateReview({
      user,
      vinyl,
      ...reviewData,
    });
    expect(result).toEqual(newReview);
    expect(reviewRepository.create).toHaveBeenCalledWith({
      user,
      vinyl,
      ...reviewData,
    });
    expect(reviewRepository.save).toHaveBeenCalledWith(newReview);
  });

  it('should find all reviews for a specific vinyl by vinylId', async () => {
    const vinylId = 1;
    const reviews = [
      {
        id: 1,
        rating: 5,
        comment: 'Great!',
        user: { id: 1 },
        vinyl: { id: vinylId },
      },
    ] as Review[];

    jest.spyOn(reviewRepository, 'find').mockResolvedValue(reviews);

    const result = await service.findAllByVinylId(vinylId);
    expect(result).toEqual(
      reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        userId: review.user.id,
        vinylId: review.vinyl.id,
      })),
    );
    expect(reviewRepository.find).toHaveBeenCalledWith({
      where: { vinyl: { id: vinylId } },
      relations: ['user', 'vinyl'],
      select: {
        id: true,
        rating: true,
        comment: true,
        user: { id: true },
        vinyl: { id: true },
      },
    });
  });

  it('should find and count reviews by vinylId', async () => {
    const vinylId = 1;
    const reviews = [
      { id: 1, rating: 4, comment: 'Good!', vinyl: { id: vinylId } },
    ] as Review[];

    jest
      .spyOn(reviewRepository, 'findAndCount')
      .mockResolvedValue([reviews, 1]);

    const [foundReviews, count] = await service.findAndCountById(vinylId);
    expect(foundReviews).toEqual(reviews);
    expect(count).toBe(1);
    expect(reviewRepository.findAndCount).toHaveBeenCalledWith({
      where: { vinyl: { id: vinylId } },
    });
  });

  it('should find a review by id', async () => {
    const reviewId = 1;
    const review = {
      id: reviewId,
      rating: 4,
      comment: 'Good!',
      vinyl: { id: 1 },
    } as Review;

    jest.spyOn(reviewRepository, 'findOne').mockResolvedValue(review);

    const result = await service.findOneById(reviewId);
    expect(result).toEqual(review);
    expect(reviewRepository.findOne).toHaveBeenCalledWith({
      where: { id: reviewId },
      relations: ['vinyl'],
    });
  });

  it('should delete a review by id', async () => {
    const reviewId = 1;
    const deleteResult = { affected: 1 } as DeleteResult;

    jest.spyOn(reviewRepository, 'delete').mockResolvedValue(deleteResult);

    const result = await service.deleteReview(reviewId);
    expect(result).toEqual(deleteResult);
    expect(reviewRepository.delete).toHaveBeenCalledWith(reviewId);
  });
});
