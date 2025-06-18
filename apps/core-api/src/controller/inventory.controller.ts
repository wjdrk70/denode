import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InventoryService } from '@app/inventory';
import { JwtAuthGuard } from '@app/auth/guard/jwt-auth.guard';
import { StockInDto } from '@app/inventory/dto/stock-in.dto';
import { Sku } from '@app/inventory/domain/sku';

@ApiTags('inventory 재고')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('inbound')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '재고 입고', description: '제품 재고를 입고 처리합니다.' })
  @ApiBody({ type: StockInDto })
  @ApiResponse({ status: 201, description: '재고 입고 성공', type: Sku })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '존재하지 않는 제품' })
  async stockInbound(@Body() dto: StockInDto): Promise<Sku> {
    return this.inventoryService.stockInbound(dto);
  }
}
