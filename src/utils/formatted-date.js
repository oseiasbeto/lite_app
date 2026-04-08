const moment = require("moment")

function formattedDate(date) {
    if (!date) return '';

    const now = moment();
    const postTime = moment(date); // Aceita string, Date ou timestamp
    const diffMinutes = now.diff(postTime, 'minutes');
    const diffHours = now.diff(postTime, 'hours');
    const diffDays = now.diff(postTime, 'days');
    const diffWeeks = now.diff(postTime, 'weeks');
    const diffMonths = now.diff(postTime, 'months');
    const diffYears = now.diff(postTime, 'years');

    // < 1 minuto → "Agora"
    if (diffMinutes < 1) {
        return 'Agora';
    }

    // 1–59 minutos → "Xm"
    if (diffMinutes < 60) {
        return `${diffMinutes}m`;
    }

    // 1–23 horas → "Xh"
    if (diffHours < 24) {
        return `${diffHours}h`;
    }

    // 1–6 dias → "Xd"
    if (diffDays < 7) {
        return `${diffDays}d`;
    }

    // 7 dias até ~4 semanas → "há X semanas" ou dia da semana se recente
    if (diffWeeks < 5) {
        if (diffDays < 14) {
            // Para 7–13 dias: mostra o dia da semana (ex: "terça-feira")
            return postTime.format('dddd');
        }
        return `${diffWeeks} ${diffWeeks === 1 ? 'semana' : 'semanas'} atrás`;
    }

    // Meses (até 11 meses) → "X mês(es) atrás"
    if (diffMonths < 12) {
        return `${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'} atrás`;
    }

    // Anos → "X ano(s) atrás"
    if (diffYears < 10) { // Limite razoável
        return `${diffYears} ${diffYears === 1 ? 'ano' : 'anos'} atrás`;
    }

    // Muito antigo (>10 anos ou fallback) → data curta
    return postTime.format('D MMM YYYY'); // ex: "15 fev 2025"
}

module.exports = formattedDate