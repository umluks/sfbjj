import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import {
  INITIAL_STUDENTS,
  INITIAL_SCHEDULE,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ATTENDANCES
} from './src/mockData.js';

dotenv.config();

import ws from 'ws';
(global as any).WebSocket = ws;

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in .env file.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function parseDate(d: string): string | null {
  if (!d) return null;
  if (d.includes('/')) {
    const parts = d.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  if (d.length === 4) return `${d}-01-01`;
  if (d.match(/^\d{4}-\d{2}-\d{2}$/)) return d;
  return null;
}

async function seed() {
  console.log('Seeding Avisos...');
  for (const ann of INITIAL_ANNOUNCEMENTS) {
    const { error } = await supabase.from('avisos').upsert({
      id: ann.id,
      titulo: ann.titulo,
      conteudo: ann.conteudo,
      data: parseDate(ann.data) || '2026-01-01',
      fixado: ann.fixado
    });
    if (error) console.error('Error inserting aviso', ann.id, error);
  }

  console.log('Seeding Aulas (Schedule)...');
  for (const cls of INITIAL_SCHEDULE) {
    const { error } = await supabase.from('aulas').upsert({
      id: cls.id,
      hora: cls.hora,
      categoria: cls.categoria,
      professor: cls.professor,
      diasSemana: cls.diasSemana
    });
    if (error) console.error('Error inserting aula', cls.id, error);
  }

  console.log('Seeding Alunos and Pagamentos...');
  for (const stu of INITIAL_STUDENTS) {
    const { data: studentData, error: studentError } = await supabase.from('alunos').upsert({
      id: stu.id,
      nome: stu.nome,
      cpf: stu.cpf,
      dataNascimento: parseDate(stu.dataNascimento) || '2000-01-01',
      telefone: stu.telefone,
      email: stu.email,
      genero: stu.genero,
      dataMatricula: parseDate(stu.dataMatricula) || '2026-01-01',
      bairro: stu.bairro,
      faixa: stu.faixa,
      graus: stu.graus,
      dataUltimaGraduacao: parseDate(stu.dataUltimaGraduacao) || '2026-01-01',
      contatoEmergenciaNome: stu.contatoEmergenciaNome,
      contatoEmergenciaTel: stu.contatoEmergenciaTel,
      status: stu.status,
      senha: stu.senha,
      turma: stu.turma,
      fotoPerfil: stu.fotoPerfil,
      modalidadePagamento: stu.modalidadePagamento
    });
    if (studentError) {
      console.error('Error inserting aluno', stu.nome, studentError);
      continue;
    }

    for (const pay of stu.pagamentos) {
      const { error: payError } = await supabase.from('pagamentos').upsert({
        id: pay.id,
        alunoId: stu.id,
        mesRef: pay.mesRef,
        valor: pay.valor,
        status: pay.status,
        dataVencimento: parseDate(pay.dataVencimento) || '2026-01-01',
        dataPagamento: parseDate(pay.dataPagamento)
      });
      if (payError) {
        console.error('Error inserting pagamento', pay.id, payError);
      }
    }
  }

  console.log('Seeding Presencas...');
  for (const att of INITIAL_ATTENDANCES) {
    const { error: attError } = await supabase.from('presencas').upsert({
      id: att.id,
      data: parseDate(att.data) || '2026-01-01',
      aulaId: att.aulaId
    });
    if (attError) {
      console.error('Error inserting presenca', att.id, attError);
      continue;
    }

    for (const studentId of att.alunosPresentes) {
      const { error: astError } = await supabase.from('presencas_alunos').insert({
        presencaId: att.id,
        alunoId: studentId
      });
      if (astError) {
        console.error('Error inserting presencas_alunos', att.id, studentId, astError);
      }
    }
  }

  // Optional: update sequences to avoid collisions later
  const { error: seqError } = await supabase.rpc('update_sequences');
  if (seqError) {
    console.log('Sequence update skipped (RPC not found, but it is fine).');
  }

  console.log('Seeding complete.');
}

seed().catch(console.error);
