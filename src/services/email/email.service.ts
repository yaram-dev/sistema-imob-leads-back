import { Resend } from "resend";

import { AppError } from "../../errors/AppError";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error("RESEND_API_KEY não foi configurada no arquivo .env.");
}

const resend = new Resend(resendApiKey);

const remetente = "Sistema Imobiliária <onboarding@resend.dev>";

export async function enviarEmailRecuperacaoSenha(
  destinatario: string,
  token: string,
) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  const linkRecuperacao = `${frontendUrl}/admin/redefinir-senha?token=${encodeURIComponent(
    token,
  )}`;

  console.log(">>> INICIANDO ENVIO DE E-MAIL PARA:", destinatario);

  const resultado = await resend.emails.send({
    from: remetente,
    to: destinatario,
    subject: "Redefinição de senha",
    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #334155;
          max-width: 600px;
          margin: 0 auto;
        "
      >
        <h2 style="color: #1e3a8a;">
          Redefinição de senha
        </h2>

        <p>
          Olá, ${destinatario}.
        </p>

        <p>
          Recebemos uma solicitação para redefinir a senha
          de acesso ao sistema administrativo.
        </p>

        <p>
          Clique no botão abaixo para criar uma nova senha:
        </p>

        <p style="margin: 30px 0;">
          <a
            href="${linkRecuperacao}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background-color: #2563eb;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            "
          >
            Redefinir minha senha
          </a>
        </p>

        <p>
          Este link é válido por <strong>1 hora</strong>.
        </p>

        <p>
          Se você não solicitou a redefinição da senha,
          pode ignorar este e-mail.
        </p>

        <p style="margin-top: 30px; color: #64748b;">
          Sistema Administrativo
        </p>
      </div>
    `,
  });

  console.log(">>> RESPOSTA DO RESEND:", resultado);

  if (resultado.error) {
    console.error(">>> ERRO RETORNADO PELO RESEND:", resultado.error);

    throw new AppError(
      `Não foi possível enviar o e-mail: ${resultado.error.message}`,
      502,
    );
  }

  console.log(">>> E-MAIL ACEITO PELO RESEND. ID:", resultado.data?.id);

  return resultado.data;
}
