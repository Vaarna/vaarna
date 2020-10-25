package main

import (
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

type Image interface {
}

type ImageStore interface {
	PutImage(io.Reader) (string, error)
	HandleImage(string, http.ResponseWriter, *http.Request) error
	HandleImageThumbnail(string, http.ResponseWriter, *http.Request) error
}

type S3ImageStore struct {
	bucket string
	region string
	s3     *s3.S3
}

func NewS3ImageStore(session *session.Session, bucket string) S3ImageStore {
	out := S3ImageStore{
		bucket: bucket,
		region: *session.Config.Region,
		s3:     s3.New(session),
	}

	return out
}

func s3URL(bucket, region, key string) string {
	return fmt.Sprint("https://%s.s3-%s.amazonaws.com/%s", bucket, region, key)
}

func (s S3ImageStore) HandleImage(key string, w http.ResponseWriter, r *http.Request) error {
	_, err := s.s3.HeadObject(&s3.HeadObjectInput{
		Bucket: &s.bucket,
		Key:    aws.String(key),
	})
	if err != nil {
		http.NotFound(w, r)
		return nil
	}

	http.Redirect(w, r, s3URL(s.bucket, s.region, key), http.StatusTemporaryRedirect)
	return nil
}

func (s S3ImageStore) HandleImageThumbnail(key string, w http.ResponseWriter, r *http.Request) error {
	return s.HandleImage("thmb-"+key, w, r)
}

func main() {
	fmt.Printf("hi mom")
	time.Sleep(5 * time.Second)
	fmt.Printf("hello world")
}
