import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, DeleteResult, Repository } from 'typeorm';
import { Review } from '../../../features/reviews/entities/review.entity';
import { Vinyl } from '../../../features/vinyl/entities/vinyl.entity';
import { User } from '../../../features/users/entities/user.entity';
import { ReviewToDisplay } from '../../interfaces/review-to-display.interface';

@Injectable()
export class ReviewRepositoryService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  createReview(
    vinyl: Vinyl,
    user: User,
    rating: number,
    comment: string,
  ): Review {
    return this.reviewRepository.create({
      vinyl,
      user,
      rating,
      comment,
    });
  }

  async saveOrUpdateReview(review: DeepPartial<Review>): Promise<Review> {
    const userId = review.user?.id;
    const vinylId = review.vinyl?.id;

    if (!userId || !vinylId) {
      throw new Error('User ID and Vinyl ID are required');
    }

    const existingReview = await this.reviewRepository.findOne({
      where: { user: { id: userId }, vinyl: { id: vinylId } },
    });

    if (existingReview) {
      Object.assign(existingReview, review);
      return this.reviewRepository.save(existingReview);
    } else {
      const newReview = this.reviewRepository.create(review);
      return this.reviewRepository.save(newReview);
    }
  }

  async findAllByVinylId(vinylId: number): Promise<ReviewToDisplay[]> {
    const reviews = await this.reviewRepository.find({
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

    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      userId: review.user.id,
      vinylId: review.vinyl.id,
    }));
  }

  async findAndCountById(vinylId: number): Promise<[Review[], number]> {
    return this.reviewRepository.findAndCount({
      where: { vinyl: { id: vinylId } },
    });
  }

  async findOneById(reviewId: number): Promise<Review | null> {
    return this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: ['vinyl'],
    });
  }

  async deleteReview(reviewId: number): Promise<DeleteResult> {
    return this.reviewRepository.delete(reviewId);
  }
}
