-- Atualizar pontos de embarque para os valores corretos
-- Primeiro, limpar os pontos antigos
DELETE FROM boarding_points WHERE eventId = 1;

-- Inserir os novos pontos de embarque
INSERT INTO boarding_points (eventId, city, locationName, meetingTime, departureTime, isActive) VALUES
(1, 'BETIM', 'PARTAGE SHOPPING BETIM', '06:00', '06:30', true),
(1, 'CONTAGEM', 'PRAÇA DA CEMIG', '06:30', '07:00', true),
(1, 'BELO HORIZONTE', 'PRAÇA DA ESTAÇÃO', '07:00', '07:30', true),
(1, 'BELO HORIZONTE', 'MINAS SHOPPING', '07:15', '07:45', true),
(1, 'BELO HORIZONTE', 'SHOPPING ESTAÇÃO', '07:30', '08:00', true),
(1, 'SANTA LUZIA', 'SORVETERIA 4 ESTAÇÃO', '07:45', '08:15', true);
