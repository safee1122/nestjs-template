import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { CustomPipe } from 'src/pipe/customValidation.pipe';
import { RoleEnum } from '../../common/enums/role.enum';
import { EditUserDto } from './dto/editUser.dto';
import { InviteUserDto } from './dto/inviteUser.dto';
import { EditUserRoleDto } from './dto/editUserRole.dto';
import { GetUserRequestDto2 } from './dto/getUsers.dto';
import { UserIdDto } from './dto/userId.dto';

import { UsersService } from './users.service';
import { createSignedLink } from 'src/generalUtils/aws-config';
import { FileInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "../../generalUtils/helper";
import { AssignRolesDto } from "./dto/assign-roles.dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { User } from "./entities/user.entity";
import { CurrentUser } from "../../decorators/current-user.decorator";

const bucketName = process.env.AWS_BUCKET;

@ApiTags('User')
@ApiBearerAuth('JWT-auth')
@Controller('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {
  }

  @Get('/roles')
  @UseGuards(JwtAuthGuard)
  async getRoles() {
    try {
      return this.userService.findAllRoles();
    } catch (err) {
      console.log(err);
    }
  }


  @Get('/get-all')
  // @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  getUsers(@Query() getUsersDto: GetUserRequestDto2, @CurrentUser() user: User) {
    console.log({getUsersDto})
    return this.userService.getAllUsers(getUsersDto, user);
  }

  @Get('/me')
  @Roles(RoleEnum.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getUser(@Req() request) {
    return this.userService.getUser(request.user.id);
  }

  @Get('/presignedUrl')
  @UseGuards(JwtAuthGuard)
  getPreSignedUrl() {
    return createSignedLink(bucketName, 'Test Folder/test.txt', 'getObject');
  }

  @Get('/upload-picture')
  // @UseGuards(JwtAuthGuard)
  getUploadPictureUrl(@Req() request, @Param() param) {
    return createSignedLink(
      bucketName,
      // `Test Folder/${request.user.id}/${param.fileName}`,
      `Test Folder/${param.fileName}`,
      'putObject',
    );
  }

  @Get('/:id')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getUserById(@Param() param: UserIdDto) {
    const { id } = param;
    return this.userService.getUser(id);
  }

  @Put('/update-profile')
  @UseGuards(JwtAuthGuard)
  @UsePipes(CustomPipe)
  updateProfile(@Req() request, @Body() userProfileDto: EditUserDto) {
    return this.userService.updateProfile(request.user, userProfileDto);
  }

  @Patch('/update-role')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateRole(@Body() editRoleDto: EditUserRoleDto) {
    return this.userService.updateUserRole(editRoleDto);
  }

  @Delete('/delete-user')
  @Roles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  deleteUser(@Query(ValidationPipe) userId: UserIdDto) {
    const { id } = userId
    return this.userService.deleteUser(id);
  }

  @Post('/invite-user')
  @Roles(RoleEnum.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async forgetPassword(
    @Body(ValidationPipe) inviteUserDto: InviteUserDto,
    @CurrentUser() user: User,
  ): Promise<{ message: any }> {
    const status = await this.userService.inviteUser(
      inviteUserDto.email,
      inviteUserDto.roleId,
      user.tenant
    );
    return { message: status };
  }

  // upload picture
  @Post('/upload-picture')
  // @Roles(RoleEnum.USER, RoleEnum.ADMIN)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadPicture(@Req() request, @UploadedFile() file) {
    if (request.fileValidationError) {
      throw new BadRequestException(request.fileValidationError);
    }
    if (!file)
      throw new BadRequestException("Something bad happened on our end, please try again.");
    file.path = file.path.replace("public/", "");
    const updateResult = await this.userService.updateProfileURL(request.user.id, file.path);
    if (updateResult.affected) return file;
    throw new InternalServerErrorException("Something bad happened while updating profile picture");
  }

  @Delete('profile-picture')
  @UseGuards(JwtAuthGuard)
  deletePicture(@Req() request: any) {
    console.log(request.user);
    return this.userService.deletePicture(request.user);
  }

  @Post("/assign-roles")
  assignRoles(@Body() userRoles: AssignRolesDto) {
    return this.userService.assignRoles(userRoles);
  }

}
