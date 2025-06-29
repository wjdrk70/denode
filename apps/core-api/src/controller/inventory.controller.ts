import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from '@app/inventory';
import { JwtAuthGuard } from '@app/auth/guard/jwt-auth.guard';
import { StockRequestDto } from '@app/inventory/dto/request/stock-request.dto';
import { Sku } from '@app/inventory/domain/sku';
import { StockResponseDto } from '@app/inventory/dto/response/stock-response.dto';
import { Request } from 'express';
import { StockListResponseDto } from '@app/inventory/dto/response/stock-list-response.dto';
import { StockListRequestDto } from '@app/inventory/dto/request/stock-list-request.dto';
import { StockHistoryListResponseDto } from '@app/inventory/dto/response/stock-history-list.response.dto';
import { StockHistoryRequestDto } from '@app/inventory/dto/request/stock-history-request.dto';
import { OutboundRequestDto } from '@app/inventory/dto/request/outbound-request.dto';
import { OutboundResponseDto } from '@app/inventory/dto/response/outbound-response.dto';

@ApiTags('inventory 재고')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '보유 재고 목록 조회', description: '보유한 재고(SKU) 목록을 페이지네이션하여 조회합니다.' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: '조회 시작 위치' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '조회할 개수' })
  @ApiResponse({ status: 200, description: '조회 성공', type: StockListResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getInventory(@Query() dto: StockListRequestDto): Promise<StockListResponseDto> {
    return this.inventoryService.getStock(dto);
  }

  @Get(':productId/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '특정 제품의 재고 히스토리 조회' })
  @ApiParam({ name: 'productId', description: '제품 ID', type: Number })
  @ApiResponse({ status: 200, description: '조회 성공', type: StockHistoryListResponseDto })
  async getStockHistory(
    @Param('productId', ParseIntPipe) productId: number,
    @Query() dto: StockHistoryRequestDto,
  ): Promise<StockHistoryListResponseDto> {
    return this.inventoryService.getStockHistory(productId, dto);
  }

  @Post('inbound')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '재고 입고', description: '제품 재고를 입고 처리합니다.' })
  @ApiBody({ type: StockRequestDto })
  @ApiResponse({ status: 200, description: '재고 입고 성공', type: Sku })
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
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '재고 출고 (FEFO 적용)',
    description: '제품 ID와 수량만으로 유통기한 임박순으로 재고를 출고합니다.',
  })
  @ApiBody({ type: OutboundRequestDto })
  @ApiResponse({ status: 201, description: '재고 출고 성공', type: Sku })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터 (재고 부족 등)' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '존재하지 않는 제품 또는 SKU' })
  async stockOutbound(@Body() dto: OutboundRequestDto, @Req() req: Request): Promise<OutboundResponseDto> {
    const userId = (req.user as any).userId;
    const result = await this.inventoryService.stockOutbound(dto, userId);
    return new OutboundResponseDto(result.productId, result.totalRemainingQuantity);
  }
}
