import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from '../dto/create-review.dto';
import { Review } from '../entities/review.entity';
import { UserRepositoryService } from '../../../common/repositories/user-repository/user-repository.service';
import { VinylRepositoryService } from '../../../common/repositories/vinyl-repository/vinyl-repository.service';
import { ReviewRepositoryService } from '../../../common/repositories/review-repository/review-repository.service';
import { ReviewToDisplay } from '../../../common/interfaces/review-to-display.interface';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly vinylRepository: VinylRepositoryService,
    private readonly userRepository: UserRepositoryService,
    private readonly reviewRepository: ReviewRepositoryService,
  ) {}

  async addReview(
    createReviewDto: CreateReviewDto,
    userId: number,
  ): Promise<Review> {
    const { vinylId, rating, comment } = createReviewDto;

    const vinyl = await this.vinylRepository.findVinylById(vinylId);
    if (!vinyl) {
      throw new NotFoundException('Vinyl not found');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const createdReview = this.reviewRepository.createReview(
      vinyl,
      user,
      rating,
      comment,
    );

    const newReview =
      await this.reviewRepository.saveOrUpdateReview(createdReview);
    await this.updateAverageRating(vinylId);

    return newReview;
  }

  async updateAverageRating(vinylId: number): Promise<void> {
    const [reviews, totalReviews] =
      await this.reviewRepository.findAndCountById(vinylId);

    if (totalReviews > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      let averageRating = totalRating / totalReviews;

      averageRating = Math.min(Math.max(averageRating, 0), 9.99);

      averageRating = parseFloat(averageRating.toFixed(2));

      await this.vinylRepository.updateVinyl(vinylId, averageRating);
    }
  }

  async findAllByVinyl(vinylId: number): Promise<ReviewToDisplay[]> {
    return this.reviewRepository.findAllByVinylId(vinylId);
  }

  async deleteReview({
    reviewId,
    vinylId,
  }: {
    reviewId: number;
    vinylId: number;
  }): Promise<{ message: string }> {
    const vinyl = await this.vinylRepository.findOne(vinylId);

    if (!vinyl) {
      throw new NotFoundException(`Vinyl with id ${vinylId} was not found`);
    }

    const review = vinyl.reviews.find((r) => Number(r.id) === Number(reviewId));

    if (!review) {
      throw new NotFoundException(`Review with id ${reviewId} was not found`);
    }

    const result = await this.reviewRepository.deleteReview(reviewId);
    if (result.affected === 0) {
      throw new NotFoundException(`Review with id ${reviewId} was not found`);
    }

    await this.updateAverageRating(vinyl.id);

    return { message: 'Review deleted successfully' };
  }
}
