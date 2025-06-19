import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { InventoryService } from '@app/inventory';
import { JwtAuthGuard } from '@app/auth/guard/jwt-auth.guard';
import { StockRequestDto } from '@app/inventory/dto/request/stock-request.dto';
import { Sku } from '@app/inventory/domain/sku';
import { StockResponseDto } from '@app/inventory/dto/response/stock-response.dto';
import { Request } from 'express';

@ApiTags('inventory 재고')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('inbound')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '재고 입고', description: '제품 재고를 입고 처리합니다.' })
  @ApiBody({ type: StockRequestDto })
  @ApiResponse({ status: 201, description: '재고 입고 성공', type: Sku })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '존재하지 않는 제품' })
  async stockInbound(@Body() dto: StockRequestDto, @Req() req: Request): Promise<StockResponseDto> {
    const userId = (req.user as any).userId;
    const sku = await this.inventoryService.stockInbound(dto, userId);
    return new StockResponseDto(sku);
  }

  @Post('outbound')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '재고 출고', description: '제품 재고를 출고 처리합니다.' })
  @ApiBody({ type: StockRequestDto })
  @ApiResponse({ status: 201, description: '재고 출고 성공', type: Sku })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터 (재고 부족 등)' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '존재하지 않는 제품 또는 SKU' })
  async stockOutbound(@Body() dto: StockRequestDto, @Req() req: Request): Promise<StockResponseDto> {
    const userId = (req.user as any).userId;
    const sku = await this.inventoryService.stockOutbound(dto, userId);
    return new StockResponseDto(sku);
  }
}
