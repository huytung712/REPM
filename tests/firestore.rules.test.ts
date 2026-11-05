/**
 * Kiểm thử firestore.rules bằng Firebase Emulator.
 * Chạy: npm run test:rules   (tự khởi động emulator)
 */
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import { initializeTestEnvironment, assertFails, assertSucceeds, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, addDoc, collection, getDocs } from 'firebase/firestore';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-repm',
    firestore: { rules: fs.readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});
afterAll(async () => env?.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users/admin1'), { uid: 'admin1', role: 'admin', email: 'a@x.vn', displayName: 'A' });
    await setDoc(doc(db, 'users/mgr1'), { uid: 'mgr1', role: 'manager', email: 'm@x.vn', displayName: 'M' });
    await setDoc(doc(db, 'users/view1'), { uid: 'view1', role: 'viewer', email: 'v@x.vn', displayName: 'V' });
    await setDoc(doc(db, 'projects/p1'), { name: 'P1', milestones: [] });
    await setDoc(doc(db, 'activity/a1'), { actorUid: 'mgr1', at: 1 });
  });
});

const as = (uid: string, token: Record<string, any> = {}) => env.authenticatedContext(uid, token).firestore();

describe('chưa đăng nhập', () => {
  it('không đọc được dự án', async () => {
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'projects/p1')));
  });
});

describe('viewer', () => {
  it('đọc được dự án, không sửa được', async () => {
    const db = as('view1');
    await assertSucceeds(getDoc(doc(db, 'projects/p1')));
    await assertFails(updateDoc(doc(db, 'projects/p1'), { name: 'x' }));
    await assertFails(addDoc(collection(db, 'tasks'), { title: 't' }));
  });
  it('không tự nâng quyền', async () => {
    await assertFails(updateDoc(doc(as('view1'), 'users/view1'), { role: 'admin' }));
    await assertSucceeds(updateDoc(doc(as('view1'), 'users/view1'), { displayName: 'Tên mới' }));
  });
  it('không đọc danh sách người dùng', async () => {
    await assertFails(getDocs(collection(as('view1'), 'users')));
  });
});

describe('manager', () => {
  it('sửa dự án, tạo/xoá công việc và tài liệu', async () => {
    const db = as('mgr1');
    await assertSucceeds(updateDoc(doc(db, 'projects/p1'), { name: 'P1b' }));
    const t = await assertSucceeds(addDoc(collection(db, 'tasks'), { title: 't' }));
    await assertSucceeds(deleteDoc(t));
    await assertSucceeds(addDoc(collection(db, 'documents'), { name: 'd', url: 'https://x' }));
  });
  it('không tạo/xoá dự án, không nhập dữ liệu meta, không đổi vai trò', async () => {
    const db = as('mgr1');
    await assertFails(setDoc(doc(db, 'projects/p2'), { name: 'P2' }));
    await assertFails(deleteDoc(doc(db, 'projects/p1')));
    await assertFails(setDoc(doc(db, 'meta/portfolio'), { x: 1 }));
    await assertFails(updateDoc(doc(db, 'users/view1'), { role: 'manager' }));
  });
  it('nhật ký chỉ ghi thêm, đúng người ghi', async () => {
    const db = as('mgr1');
    await assertSucceeds(addDoc(collection(db, 'activity'), { actorUid: 'mgr1', at: 2 }));
    await assertFails(addDoc(collection(db, 'activity'), { actorUid: 'someone-else', at: 2 }));
    await assertFails(updateDoc(doc(db, 'activity/a1'), { at: 3 }));
    await assertFails(deleteDoc(doc(db, 'activity/a1')));
  });
});

describe('admin', () => {
  it('đổi vai trò, ghi dự án và meta', async () => {
    const db = as('admin1');
    await assertSucceeds(updateDoc(doc(db, 'users/view1'), { role: 'manager' }));
    await assertSucceeds(setDoc(doc(db, 'projects/p2'), { name: 'P2' }));
    await assertSucceeds(setDoc(doc(db, 'meta/portfolio'), { x: 1 }));
    await assertSucceeds(getDocs(collection(db, 'users')));
  });
});

describe('đăng ký tài khoản mới', () => {
  it('tự tạo hồ sơ với vai trò viewer', async () => {
    await assertSucceeds(setDoc(doc(as('new1'), 'users/new1'), { uid: 'new1', role: 'viewer', email: 'n@x.vn' }));
  });
  it('không tự tạo hồ sơ admin/manager', async () => {
    await assertFails(setDoc(doc(as('new2'), 'users/new2'), { uid: 'new2', role: 'admin' }));
    await assertFails(setDoc(doc(as('new3'), 'users/new3'), { uid: 'new3', role: 'manager' }));
  });
  it('email quản trị khởi tạo (đã xác minh) được tạo hồ sơ admin', async () => {
    const db = as('boot', { email: 'huytung712@gmail.com', email_verified: true });
    await assertSucceeds(setDoc(doc(db, 'users/boot'), { uid: 'boot', role: 'admin' }));
  });
  it('email quản trị chưa xác minh thì không', async () => {
    const db = as('boot2', { email: 'huytung712@gmail.com', email_verified: false });
    await assertFails(setDoc(doc(db, 'users/boot2'), { uid: 'boot2', role: 'admin' }));
  });
});
