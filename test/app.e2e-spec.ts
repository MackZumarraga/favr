import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { SignInDto, SignUpDto } from '../src/auth/dto';
import { CreateItemDto, EditItemDto } from '../src/item/dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { EditUserDto } from '../src/user/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const signUpDto: SignUpDto = {
      email: 'test@test.com',
      password: 'test',
      firstName: 'first name test',
      lastName: 'last name test',
    };
    const SignInDto: SignInDto = {
      email: 'test@test.com',
      password: 'test',
    };
    describe('Signup', () => {
      it('should throw if email is empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: signUpDto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password is empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: signUpDto.email,
          })
          .expectStatus(400);
      });

      it('should throw if no arguments passed', async () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });

      it('should signup', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(signUpDto)
          .expectStatus(201)
          .stores('userId', 'userId');
      });
    });

    describe('Signin', () => {
      it('should throw if email is empty', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: SignInDto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password is empty', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: SignInDto.email,
          })
          .expectStatus(400);
      });

      it('should throw if no arguments passed', async () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      it('should signin', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(SignInDto)
          .expectStatus(200)
          .stores('userAccessToken', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', async () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200);
      });
    });

    describe('Get users', () => {
      it('should get existing users', async () => {
        return pactum
          .spec()
          .get('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get user by id', () => {
      it('should get user by UserId', async () => {
        return pactum
          .spec()
          .get('/users/{id}')
          .withPathParams('id', '$S{userId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{userId}');
      });
    });

    describe('Edit user', () => {
      it('should edit user', async () => {
        const dto: EditUserDto = {
          firstName: 'updateFirstName',
          email: 'update@test.com',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe('Item', () => {
    describe('Get empty items', () => {
      it('should get zero amount of items', async () => {
        return pactum
          .spec()
          .get('/items')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create item', () => {
      const dto: CreateItemDto = {
        title: 'Mount TV',
        description: 'Need help mounting a heavy flatscreen TV',
      };
      it('should create item', async () => {
        return pactum
          .spec()
          .post('/items')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('itemId', 'id');
      });
    });

    describe('Get items', () => {
      it('should get existing items', async () => {
        return pactum
          .spec()
          .get('/items')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get item by id', () => {
      it('should get item by itemId', async () => {
        return pactum
          .spec()
          .get('/items/{id}')
          .withPathParams('id', '$S{itemId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{itemId}');
      });
    });

    describe('Edit item', () => {
      const dto: EditItemDto = {
        title: 'Need an accordion player',
        description:
          'Folk music band accordion player is sick and need new player',
      };
      it('should edit item by itemId', async () => {
        return pactum
          .spec()
          .patch('/items/{id}')
          .withPathParams('id', '$S{itemId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete item', () => {
      it('should delete item by itemId', async () => {
        return pactum
          .spec()
          .delete('/items/{id}')
          .withPathParams('id', '$S{itemId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(204);
      });

      it('should get zero amount of items', async () => {
        return pactum
          .spec()
          .get('/items')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
