import graphene
from dashboard.graphql.query import Query

schema = graphene.Schema(query=Query)