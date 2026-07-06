import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { PredictionsService } from '../predictions/predictions.service';
import { MatchStatus } from '@prisma/client';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly predictionsService: PredictionsService,
  ) {}

  @Cron('*/20 * * * *')
  async handleCron() {
    this.logger.log('Iniciando sincronización de marcadores desde thesportsdb.com...');
    await this.syncMatches();
  }

  async syncMatches() {
    try {
      // Obtener todos los partidos que tengan un externalId y no hayan finalizado
      const matches = await this.prisma.match.findMany({
        where: {
          externalId: { not: null },
          status: { not: MatchStatus.FINISHED },
        },
        include: {
          predictions: true,
        },
      });

      this.logger.log(`Encontrados ${matches.length} partidos pendientes de sincronización.`);

      for (const match of matches) {
        if (!match.externalId) continue;

        const url = `https://www.thesportsdb.com/api/v1/json/3/lookupevent.php?id=${match.externalId}`;
        const response = await fetch(url);
        if (!response.ok) {
          this.logger.error(`Error al consultar TheSportsDB para evento ${match.externalId}: ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        const events = data.events || [];
        if (events.length === 0) {
          this.logger.warn(`No se encontró el evento ${match.externalId} en TheSportsDB.`);
          continue;
        }

        const event = events[0];

        const homeScoreStr = event.intHomeScore;
        const awayScoreStr = event.intAwayScore;

        // Si no hay goles registrados aún, no actualizamos nada
        if (homeScoreStr === null || awayScoreStr === null || homeScoreStr === undefined || awayScoreStr === undefined) {
          continue;
        }

        const intHomeScore = parseInt(homeScoreStr, 10);
        const intAwayScore = parseInt(awayScoreStr, 10);

        if (isNaN(intHomeScore) || isNaN(intAwayScore)) continue;

        const isFinished = event.strStatus === 'FT';

        if (isFinished) {
          // El partido terminó: actualizamos goles, cambiamos status a FINISHED y procesamos predicciones
          await this.prisma.match.update({
            where: { id: match.id },
            data: {
              homeScore: intHomeScore,
              awayScore: intAwayScore,
              status: MatchStatus.FINISHED,
            },
          });

          for (const prediction of match.predictions) {
            const points = this.predictionsService.calculatePoints(
              prediction.homeScoreBet,
              prediction.awayScoreBet,
              intHomeScore,
              intAwayScore,
            );

            await this.prisma.prediction.update({
              where: { id: prediction.id },
              data: { points },
            });

            // Actualizar ranking de usuario en todos sus grupos asociados
            const memberships = await this.prisma.groupMembership.findMany({
              where: { userId: prediction.userId },
            });

            for (const membership of memberships) {
              await this.prisma.groupMembership.update({
                where: { id: membership.id },
                data: {
                  scoreAcumulado: { increment: points },
                },
              });
            }
          }

          this.logger.log(`Partido ${match.homeTeam} vs ${match.awayTeam} finalizado. Marcador real: ${intHomeScore}-${intAwayScore}. Puntos calculados.`);
        } else {
          // El partido está en vivo: actualizamos marcador y cambiamos estado a LIVE
          const hasChanged = match.homeScore !== intHomeScore || match.awayScore !== intAwayScore || match.status !== MatchStatus.LIVE;
          if (hasChanged) {
            await this.prisma.match.update({
              where: { id: match.id },
              data: {
                homeScore: intHomeScore,
                awayScore: intAwayScore,
                status: MatchStatus.LIVE,
              },
            });
            this.logger.log(`Partido en vivo: ${match.homeTeam} vs ${match.awayTeam} actualizado a ${intHomeScore}-${intAwayScore}.`);
          }
        }
      }

      this.logger.log('Proceso de sincronización finalizado.');
    } catch (error: any) {
      this.logger.error('Error al sincronizar marcadores', error.stack);
    }
  }
}
