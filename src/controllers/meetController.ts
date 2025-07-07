import { NextFunction, Response } from "express";
import catchAsync from "../middleware/catchAsync.middleware";
import { Request } from "../types/user";
import { plainToInstance } from "class-transformer";
import { MeetDto } from "../dto/newMeetDto";
import { validate } from "class-validator";
import { StatusCode } from "../utils/statusCode";
import { AppError } from "../middleware/error.middleware";
import { meetRepository, userRepository } from "../utils/repository";

export class MeetController {
  createMeet = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const meetDto = plainToInstance(MeetDto, req.body);

    const errors = await validate(meetDto);
    if (errors.length > 0) return next(new AppError(errors.map(err => Object.values(err.constraints || {})).join(", "), StatusCode.BAD_REQUEST));

    const meetExists = await meetRepository.findOne({
      where: {
        title: meetDto.title
      }
    });

    if (meetExists) return next(new AppError("This title is given to meeting already, please choose another name", StatusCode.CONFLICT));

    const user = await userRepository.findOne({
      where: { id: req.user.id }
    });

    if (!user) return next(new AppError("Unauthorized user", StatusCode.UNAUTHORIZED));

    const newMeeting = meetRepository.create({
      createBy: user,
      ...meetDto
    });

    await meetRepository.save(newMeeting);

    res.status(StatusCode.CREATED).json({
      success: true
    });

  });

  getAMeet = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id) return next(new AppError('Meeting ID is missen', StatusCode.BAD_REQUEST));

    const meet = await meetRepository.findOne({
      where: { meetingId: id }
    });

    if (!meet) return next(new AppError("Invalid meeting link", StatusCode.BAD_REQUEST));

    res.json(meet);
  });

}