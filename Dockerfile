FROM registry.access.redhat.com/rhscl/nginx-112-rhel7
LABEL multi.label1="${MY_ENV}" \
      multi.label2="value2" \
      other="value3"
COPY nginx.conf /etc/opt/rh/rh-nginx112/nginx/nginx.conf
COPY dist $HOME
CMD ["nginx", "-g", "daemon off;"]