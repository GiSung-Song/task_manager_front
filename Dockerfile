# 1. node 설정
FROM node:18 AS build

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. package / package-lock 복사
COPY package.json package-lock.json ./

# 4. Dependencies 설치
RUN npm ci

# 5. 프로젝트 복사
COPY . .

# 6. React 애플리케이션을 정적 파일로 빌드
RUN npm run build

# 7. Nginx 설정
FROM nginx:1.25-alpine

# 8. Nginx Configuration 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 9. build 단계에서 생성된 React 정적 파일들을 Nginx의 기본 정적 파일 경로로 복사
COPY --from=build /app/build /usr/share/nginx/html

# 10. 80포트 개방
EXPOSE 80

# 11. Nginx 실행
CMD ["nginx", "-g", "daemon off;"]