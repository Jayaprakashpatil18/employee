import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  Header,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import {
  DocumentsService,
  VerifyDocumentDto,
  RejectDocumentDto,
  ResubmitRequestDto,
} from './documents.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserRole, User } from '@prisma/client';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('documents')
@Controller('documents')
@UseGuards(ClerkAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'List all documents required for an employee' })
  async findByEmployee(
    @Param('employeeId') employeeId: string,
    @CurrentUser() user: User,
  ) {
    return this.documentsService.findByEmployee(employeeId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document details by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.documentsService.findOne(id, user);
  }

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file for document requirement (PDF, JPG, PNG <= 10MB)' })
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @CurrentUser() user: User,
  ) {
    return this.documentsService.uploadDocument(id, file, user);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Securely download or view uploaded document stream' })
  async downloadStream(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const fileData = await this.documentsService.downloadDocumentStream(id, user);
    res.setHeader('Content-Type', fileData.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(fileData.fileName)}"`,
    );
    return res.send(fileData.buffer);
  }

  @Post(':id/verify')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Verify submitted document (HR Admin & Manager)' })
  async verifyDocument(
    @Param('id') id: string,
    @Body() dto: VerifyDocumentDto,
    @CurrentUser() user: User,
  ) {
    return this.documentsService.verifyDocument(id, dto, user);
  }

  @Post(':id/reject')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Reject submitted document with required reason' })
  async rejectDocument(
    @Param('id') id: string,
    @Body() dto: RejectDocumentDto,
    @CurrentUser() user: User,
  ) {
    return this.documentsService.rejectDocument(id, dto, user);
  }

  @Post(':id/resubmit')
  @Roles(UserRole.HR_ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Request document resubmission with remarks' })
  async requestResubmission(
    @Param('id') id: string,
    @Body() dto: ResubmitRequestDto,
    @CurrentUser() user: User,
  ) {
    return this.documentsService.requestResubmission(id, dto, user);
  }
}
