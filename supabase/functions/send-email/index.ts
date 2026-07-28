import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { SMTPClient } from 'https://deno.land/x/bootstrap_smtp@v0.5.2/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ success: false, error: 'Campos obrigatórios ausentes: to, subject, html' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const hostname = Deno.env.get('SMTP_HOST') || Deno.env.get('VITE_SMTP_HOST') || 'mail.sagradafamiliabjj.com.br';
    const port = parseInt(Deno.env.get('SMTP_PORT') || Deno.env.get('VITE_SMTP_PORT') || '465');
    const username = Deno.env.get('SMTP_USER') || Deno.env.get('VITE_SMTP_USER') || 'nao-responder@sagradafamiliabjj.com.br';
    const password = Deno.env.get('SMTP_PASS') || Deno.env.get('VITE_SMTP_PASS') || '';

    const client = new SMTPClient({
      connection: {
        hostname,
        port,
        tls: true,
        auth: {
          username,
          password,
        },
      },
    });

    await client.send({
      from: `Sagrada Família BJJ <${username}>`,
      to,
      subject,
      content: html,
      html,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: 'E-mail enviado com sucesso via Supabase Edge Function' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: errMessage || 'Erro ao enviar e-mail via Edge Function' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
